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
 * 显示组件类型
 */
const Type = {
    sentence: 'sentence',
    branch: 'branch',
    linebreak: 'linebreak',
}

/**
 * 不同系统换行符
 */
const linebreak = {
    windows: '\r\n',
    linux: '\n',
    mac: '\n',
}

export function getLinebreak() {
    switch (process.platform) {
        case 'win32':
            return linebreak.windows
        case 'linux':
            return linebreak.linux
        case 'darwin':
            return linebreak.mac
    }
}

export default Mark
export { Type }
