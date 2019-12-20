import { readJson } from '@/utils/igal/readIgal'

import uuidv1 from 'uuid/v1'

const uuid = uuidv1()

/**
 * 创建新序列
 * @param {string} setting 配置文件
 */
export default async function createSequence(setting) {
    const json = await readJson(setting)
    const { customized } = json
    const [title, description] = customized
    return {
        customized: {
            [title]: '',
            [description]: '',
        },
        data: [
            {
                type: 'linebreak',
            },
        ],
        next: [],
        uuid,
    }
}
