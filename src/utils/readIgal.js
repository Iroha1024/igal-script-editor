import fs from 'fs'
/**
 * 提取igal文件内容
 * @param {string} path  igal文件地址
 * @param {Array} igal  序列列表
 */
export default function readIgal(path, igal) {
    const file = fs.readFileSync(path, 'utf-8')

    /**
     * igal标识符
     */
    const Mark = {
        start: '^',
        sentence: '>',
        branch: '?',
        end: '$',
    }
    /**
     * 不同系统换行符
     */
    const linebreak = {
        windows: '\r\n',
        unix: '\n',
        mac: '\r',
    }
    let separator
    switch (process.platform) {
        case 'darwin':
            separator = linebreak.mac
            break
        case 'freebsd':
            separator = linebreak.unix
            break
        case 'win32':
            separator = linebreak.windows
            break
    }
    const content = file.split(separator)

    let sequence,
        data,
        flag = false
    /**
     * 提取每行内容
     */
    function extractContent() {
        content.forEach(line => {
            const each_line = {}
            let part = []
            switch (line[0]) {
                case Mark.start:
                    sequence = {}
                    data = []
                    flag = true
                    line = line.slice(1)
                    part = line.split(/(?<!\\)\|/)
                    for (let index = 0; index < part.length; index++) {
                        const keyValue = part[index].split(' ')
                        const key = keyValue[0]
                        const value = keyValue[1]
                        if (key === 'uuid') {
                            sequence[key] = value
                        } else {
                            if (!sequence.customized) {
                                sequence.customized = {}
                            }
                            sequence.customized[key] = value
                        }
                    }
                    break
                case Mark.sentence:
                    part = line.split(/(?<!\\)\>/)
                    part.shift()
                    each_line.name = part[0]
                    each_line.text = part[1].split(/(?<!\\)\|/)
                    each_line.remark = part[2].split(/(?<!\\)\|/)
                    each_line.type = 'sentence'
                    data.push(each_line)
                    break
                case Mark.branch:
                    part = line.split(/(?<!\\)\|/)
                    const [question, ...choices] = part
                    each_line.question = question.slice(1)
                    each_line.choices = choices
                    each_line.type = 'branch'
                    data.push(each_line)
                    break
                case Mark.end:
                    flag = false
                    sequence.data = data
                    line = line.slice(6)
                    sequence.next = line.split(/(?<!\\)\|/)
                    igal.push(sequence)
                    break
                default:
                    if (flag) {
                        each_line.type = 'linebreak'
                        data.push(each_line)
                    }
                    break
            }
        })
    }

    extractContent()
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
    setRank(igal, head)
    load(igal, linked, unlinked)
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
 * 为每个序列附上层级（rank）
 * @param {*} head
 * @param {number} rank
 * @param {Array} igal
 */
function setRank(igal, head = {}, rank = 0) {
    if (!head.hasOwnProperty('rank') || head.rank < rank) {
        head.rank = rank++
    }
    //next首个元素不为''时
    if (head.next[0]) {
        const next = head.next.map(id => getSequence(id, igal))
        next.forEach(sequence => {
            sequence && setRank(igal, sequence, rank)
        })
    }
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
            if (!linked[index]) linked[index] = []
            linked[sequence.rank].push(sequence)
        } else {
            unlinked.push(sequence)
        }
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
