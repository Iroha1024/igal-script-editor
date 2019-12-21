export function setFontSize(fontSize) {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
}

export function setLineHeight() {
    if (document.getElementsByClassName('customized-info--key').length < 1)
        return
    const key = document.getElementsByClassName('customized-info--key')[0]
    const lineHeight = window.getComputedStyle(key).height
    if (
        document.documentElement.style.getPropertyValue('--line-height') !==
        lineHeight
    ) {
        document.documentElement.style.setProperty('--line-height', lineHeight)
    }
}
