import fs, { promises } from 'fs'
import Path from 'path'
import { EOL } from 'os'

import uuidv1 from 'uuid/v1'

import Mark, { Type } from '../sequence/mark'

/**
 * next是否为空
 * e.g. next: ['']，isNextEmpty(next) === true
 * @param {Array} arr
 */
export function isNextEmpty(arr) {
    return arr[0] === ''
}

/**
 * 分隔字符串
 * e.g. |分隔  \|不分隔
 * @param {string} content
 * @param {string} separator
 * @returns {Array}
 */
function splitBy(content, separator) {
    switch (separator) {
        case '|':
            return content.split(/(?<!\\)\|/)
        case '>':
            return content.split(/(?<!\\)\>/)
    }
}

/**
 * 同步提取igal文件内容
 * @param {string} path  igal文件地址
 * @param {Array} igal  序列列表
 * @param {string} setting  setting.json地址
 */
export default function readIgalSync(path, igal, setting) {
    const file = fs.readFileSync(path, 'utf-8')

    //读取配置文件setting.json
    let json
    try {
        json = JSON.parse(fs.readFileSync(setting, 'utf-8'))
    } catch (error) {}

    extractContent(file, json, igal)
}

/**
 * 读取json
 * @param {string} setting setting.json路径
 */
export async function readJson(setting) {
    const json = await promises.readFile(setting, 'utf-8')
    return JSON.parse(json)
}

/**
 * 异步提取igal文件内容
 * @param {string} path  igal文件地址
 * @param {string} setting  setting.json地址
 * @returns {Promise<Array>}
 */
export async function readIgal(path, setting) {
    let igal = []
    const file = await promises.readFile(path, 'utf-8')
    const json = await readJson(setting)
    extractContent(file, json, igal)
    return igal
}

/**
 * 读取文件夹内容
 * @param {string} path 文件夹路径
 * @returns {Promise<fs.Dirent[]>}
 */
export async function readDir(path) {
    const files = await promises.readdir(path, { withFileTypes: true })
    return files
}

/**
 * 读取项目下所有序列
 * @param {string} path 项目文件夹路径
 * @param {string} setting setting.json路径
 */
export async function readAllSequences(path, setting) {
    async function operateItemOfDir(path, files) {
        //存放igal的数组 e.g. [igal, igal, [sequence, sequence]]
        const wrappedList = []
        for (const file of files) {
            if (file.isDirectory()) {
                const deepWrappedList = await readAllIgal(
                    `${path}\\${file.name}`
                )
                deepWrappedList.forEach(igal => {
                    wrappedList.push(igal)
                })
            } else if (Path.extname(file.name) === '.igal') {
                const igal = await readIgal(`${path}\\${file.name}`, setting)
                wrappedList.push(igal)
            }
        }
        return wrappedList
    }
    async function readAllIgal(path) {
        const files = await readDir(path)
        const data = await operateItemOfDir(path, files)
        return data
    }

    let wrappedList, list
    wrappedList = await readAllIgal(path)
    list = wrappedList.flat()
    return list
}

function setUuid(arr) {
    return arr.map(item => ({
        value: item,
        uuid: uuidv1(),
    }))
}

/**
 * 提取每行内容
 * @param {string} file igal读取的字符串
 * @param {object} json 配置json对象
 * @param {Array} igal  序列列表
 */
function extractContent(file, json, igal) {
    const content = file.split(EOL)
    const customized = json.customized
    let sequence,
        data,
        flag = false
    content.forEach(line => {
        const each_line = {}
        each_line.uuid = uuidv1()
        let part = []
        switch (line[0]) {
            case Mark.start:
                sequence = {}
                sequence.active = false
                sequence.prev = []
                data = []
                flag = true
                line = line.slice(1)
                part = splitBy(line, '|')
                for (let index = 0; index < part.length; index++) {
                    const keyValue = part[index].split(' ')
                    const [key, value] = keyValue
                    if (key === 'uuid') {
                        sequence[key] = value
                    } else {
                        if (!sequence.customized) {
                            sequence.customized = {}
                            customized.forEach(key => {
                                sequence.customized[key] = ''
                            })
                        }
                        if (customized.includes(key)) {
                            sequence.customized[key] = value
                        }
                    }
                }
                break
            case Mark.sentence:
                part = splitBy(line, '>')
                part.shift()
                const [name, text, remark] = part
                each_line.name = name
                each_line.text = splitBy(text, '|')
                each_line.text = setUuid(each_line.text)
                each_line.remark = splitBy(remark, '|')
                each_line.remark = setUuid(each_line.remark)
                each_line.type = Type.sentence
                data.push(each_line)
                break
            case Mark.branch:
                part = splitBy(line, '|')
                const [question, ...choices] = part
                each_line.question = question.slice(1)
                each_line.choices = setUuid(choices)
                each_line.type = Type.branch
                data.push(each_line)
                break
            case Mark.end:
                flag = false
                sequence.data = data
                line = line.split(' ')[1]
                const next = splitBy(line, '|')
                if (isNextEmpty(next)) {
                    sequence.next = []
                } else {
                    sequence.next = next
                }
                igal.push(sequence)
                break
            default:
                if (flag) {
                    each_line.type = Type.linebreak
                    data.push(each_line)
                }
                break
        }
    })
}

/**
 * 对序列进行额外操作
 * @param {Array} igal  序列列表
 * @param {Array} linked    连通数组
 * @param {Array} unliked   未连通数组
 * @param {Array} echarts   echarts数据
 * @param {string} path setting.json地址
 */
export function extraOperate(igal, linked, unlinked, echarts, path) {
    const head = getConfig(path, igal)
    if (!head) return
    setProp(igal, head)
    load(igal, linked, unlinked)
    checkActiveProp(linked)
    setPosition(linked, unlinked)
    adaptEcharts(igal, echarts)
}

/**
 * 根据uuid查询序列（sequence）
 * @param {string} uuid
 * @param {Array} igal
 * @returns
 */
function getSequence(uuid, igal) {
    for (const sequence of igal) {
        if (sequence.uuid === uuid) return sequence
    }
}

/**
 * 获取head
 * @param {string} path setting.json地址
 * @param {Array} igal
 * @returns
 */
function getConfig(path, igal) {
    if (path) {
        let json
        try {
            json = JSON.parse(fs.readFileSync(path, 'utf-8'))
        } catch (error) {}
        return json && getSequence(json.head, igal)
    } else {
        return igal[0]
    }
}

/**
 * 为每个序列附上层级（rank）和祖先序列（prev）
 * @param {*} head
 * @param {number} rank
 * @param {Array} igal
 * @param {Array} prev
 */
function setProp(igal, head = {}, rank = 0, prev = []) {
    prev.forEach(uuid => {
        if (!head.prev.includes(uuid)) {
            head.prev.push(uuid)
        }
    })
    const newPrev = JSON.parse(JSON.stringify(prev))
    newPrev.push(head.uuid)
    if (!head.hasOwnProperty('rank') || head.rank < rank) {
        head.rank = rank++
    }
    const next = head.next.map(id => getSequence(id, igal))
    next.forEach(sequence => {
        sequence && setProp(igal, sequence, rank, newPrev)
    })
}

/**
 * 装载序列
 * @param {Array} igal
 * @param {Array} linked
 * @param {Array} unlinked
 */
function load(igal, linked, unlinked) {
    igal.forEach(sequence => {
        if (sequence.hasOwnProperty('rank')) {
            const index = sequence.rank
            if (!linked[index]) {
                linked[index] = []
                //linked首个sequence设为默认激活
                sequence.active = true
            }
            linked[sequence.rank].push(sequence)
        } else {
            unlinked.push(sequence)
        }
    })
}

/**
 * 防止新增或断开连接时，失去默认激活sequence，设置首个为默认
 * @param {Array} linked
 */
function checkActiveProp(linked) {
    linked.forEach(rank_list => {
        rank_list.forEach((sequence, index) => {
            if (index === 0) {
                sequence.active = true
            } else {
                sequence.active = false
            }
        })
    })
}

/**
 * 设置序列坐标
 * @param {Array} linked
 * @param {Array} unlinked
 */
function setPosition(linked, unlinked) {
    let max_rank = 0
    const line_spacing = 100,
        line_height = 100
    function setLinkedPosition(linked) {
        linked.forEach(rank_list => {
            rank_list.forEach((sequence, index) => {
                sequence.x = (index - (rank_list.length - 1) / 2) * line_spacing
                sequence.y = sequence.rank * line_height
                if (sequence.rank > max_rank) {
                    max_rank = sequence.rank
                }
            })
        })
    }

    function setUnlinkedPosition(unlinked) {
        unlinked.forEach((sequence, index) => {
            sequence.x = (index - (unlinked.length - 1) / 2) * line_spacing
            sequence.y = (max_rank + 1) * line_height
        })
    }
    setLinkedPosition(linked)
    setUnlinkedPosition(unlinked)
}

/**
 * 适配echarts数据
 * @param {Array} igal
 * @param {Object} echarts
 */
function adaptEcharts(igal, echarts) {
    igal.forEach(sequence => {
        echarts.data.push({
            name: sequence.uuid,
            x: sequence.x,
            y: sequence.y,
        })
        if (sequence.next[0]) {
            sequence.next.forEach(id => {
                const target = getSequence(id, igal)
                if (target) {
                    echarts.links.push({
                        source: sequence.uuid,
                        target: target.uuid,
                    })
                }
            })
        }
    })
}
