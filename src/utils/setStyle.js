export default function setStyle(conifg) {
    setFontSize(conifg.fontSize.value)
    setLineHeight(1.4)
    setFontFamily(conifg.fontFamily.value)
}

function setFontSize(fontSize) {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
}

function setFontFamily(fontFamily) {
    document.documentElement.style.setProperty('--font-family', fontFamily)
}

function setLineHeight(LineHeight) {
    document.documentElement.style.setProperty('--line-height', LineHeight)
}
