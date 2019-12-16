import fs from 'fs'
import Path from 'path'

import Mark, { Type, getLinebreak } from './mark'

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

export function readJson(setting) {
    return new Promise((resolve, reject) => {
        fs.readFile(setting, 'utf-8', (err, json) => {
            if (err) return reject()
            json = JSON.parse(json)
            resolve(json)
        })
    })
}

/**
 * 异步提取igal文件内容
 * @param {string} path  igal文件地址
 * @param {string} setting  setting.json地址
 */
export async function readIgal(path, setting) {
    const readFile = function() {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, file) => {
                if (err) return reject()
                resolve(file)
            })
        })
    }
    let igal = []
    const file = await readFile()
    const json = await readJson(setting)
    extractContent(file, json, igal)
    return igal
}

function firstElement(content) {
    return content[0]
}

/**
 * next是否为空
 * e.g. next: ['']，isNextEmpty(next) === true
 * @param {Array} arr
 */
export function isNextEmpty(arr) {
    return firstElement(arr) === ''
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
 * 提取每行内容
 * @param {string} file igal读取的字符串
 * @param {object} json 配置json对象
 * @param {Array} igal  序列列表
 */
function extractContent(file, json, igal) {
    let separator = getLinebreak()
    const content = file.split(separator)
    const customized = json.customized
    let sequence,
        data,
        flag = false
    content.forEach(line => {
        const each_line = {}
        let part = []
        switch (firstElement(line)) {
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
                each_line.remark = splitBy(remark, '|')
                each_line.type = Type.sentence
                data.push(each_line)
                break
            case Mark.branch:
                part = splitBy(line, '|')
                const [question, ...choices] = part
                each_line.question = question.slice(1)
                each_line.choices = choices
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
 * 读取项目下所有序列
 * @param {string} path 项目文件夹路径
 * @param {string} setting setting.json路径
 */
export async function readAllSequences(path, setting) {
    const readDir = function(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) return reject()
                resolve(files)
            })
        })
    }
    const stat = function(path, files) {
        const wrappedList = []
        const promiseList = []
        return new Promise(resolve => {
            files.forEach(file => {
                const promise = new Promise((resolve, reject) => {
                    fs.stat(`${path}\\${file}`, (err, stats) => {
                        if (err) return reject()
                        if (stats.isDirectory()) {
                            readAllIgal(`${path}\\${file}`).then(
                                deepWrappedList => {
                                    deepWrappedList.forEach(igal => {
                                        wrappedList.push(igal)
                                    })
                                    resolve()
                                }
                            )
                        } else if (Path.extname(file) === '.igal') {
                            readIgal(`${path}\\${file}`, setting).then(igal => {
                                wrappedList.push(igal)
                                resolve()
                            })
                        } else {
                            resolve()
                        }
                    })
                })
                promiseList.push(promise)
            })
            Promise.all(promiseList).then(() => {
                resolve(wrappedList)
            })
        })
    }
    async function readAllIgal(path) {
        const files = await readDir(path)
        const data = await stat(path, files)
        return data
    }

    let wrappedList, list
    wrappedList = await readAllIgal(path)
    list = wrappedList.flat()
    return list
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
        return firstElement(igal)
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
