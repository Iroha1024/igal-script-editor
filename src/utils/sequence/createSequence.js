import uuidv1 from 'uuid/v1'

import { readJson } from '@/utils/igal/readIgal'
import { Type } from '@/utils/sequence/mark'

/**
 * 创建新序列
 * @param {string} setting 配置文件
 */
export default async function createSequence(setting) {
    const json = await readJson(setting)
    const customized = {}
    for (const key of json.customized) {
        customized[key] = ''
    }
    return {
        active: false,
        customized,
        data: [createLinebreak()],
        prev: [],
        next: [],
        uuid: uuidv1(),
    }
}

export function calcSize() {
    const fontSize = document.documentElement.style.getPropertyValue(
        '--font-size'
    )
    const lineHeight = document.documentElement.style.getPropertyValue(
        '--line-height'
    )
    return parseInt(fontSize) * lineHeight
}

export function createLinebreak() {
    return {
        type: Type.linebreak,
        uuid: uuidv1(),
        MAX_LINE: 1,
        size: calcSize(),
    }
}

export function createSentence(text) {
    return {
        name: '',
        text: [
            {
                value: text,
                uuid: uuidv1(),
            },
        ],
        remark: [
            {
                value: '',
                uuid: uuidv1(),
            },
        ],
        type: Type.sentence,
        uuid: uuidv1(),
        MAX_LINE: 1,
        size: calcSize(),
    }
}

export function createBranch() {
    return {
        question: '',
        choices: [
            {
                value: '',
                uuid: uuidv1(),
            },
        ],
        type: Type.branch,
        uuid: uuidv1(),
        MAX_LINE: 4,
        size: 4 * calcSize(),
    }
}
