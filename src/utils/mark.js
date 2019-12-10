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
    unix: '\n',
    mac: '\r',
}

export function getLinebreak() {
    switch (process.platform) {
        case 'darwin':
            return linebreak.mac
        case 'freebsd':
            return linebreak.unix
        case 'win32':
            return linebreak.windows
    }
}

export default Mark
export { Type }
