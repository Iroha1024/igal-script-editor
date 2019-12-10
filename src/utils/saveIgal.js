import fs from 'fs'
import Mark, { Type, getLinebreak } from './mark'

/**
 * 保存
 * @param {Array} igal 序列数组
 * @param {string} path 文件地址
 */
export default function saveIgal(igal, path) {
    let data = igal.map(sequence => {
        const uuid = `${Mark.start}uuid ${sequence.uuid}|`
        const customized = Object.entries(sequence.customized)
            .map(([key, value]) => `${key} ${value}`)
            .join('|')
        const start = uuid + customized
        let main = sequence.data.map(line => {
            switch (line.type) {
                case Type.sentence:
                    const text = line.text.join('|')
                    const remark = line.remark.join('|')
                    return `${Mark.sentence}${line.name}${Mark.sentence}${text}${Mark.sentence}${remark}`
                case Type.branch:
                    const question = `${Mark.branch}${line.question}|`
                    const choices = line.choices.join('|')
                    return `${question}${choices}`
                case Type.linebreak:
                    return ''
            }
        })
        main = main.join(getLinebreak())
        let next = sequence.next.join('|')
        next = `${Mark.end}next ${next}`
        sequence = [start, main, next].join(getLinebreak()) + getLinebreak()
        return sequence
    })
    data = data.join(getLinebreak())
    // console.log(data);
    fs.writeFile(path, data, () => {})
}
