import fs from 'fs'

import uuidv1 from 'uuid/v1'

import { readJson } from '@/utils/readIgal'
import saveIgal from '@/utils/saveIgal'

/**
 * 创建新igal文件
 * @param {string} setting 配置文件
 * @param {string} path igal文件路径
 */
export default async function writeIgal(setting, path) {
    const json = await readJson(setting)
    const customized = json.customized
    const [title, description] = customized
    let uuid = uuidv1()
    const igal = [
        {
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
        },
    ]
    // console.log(igal);
    saveIgal(igal, path)
}
