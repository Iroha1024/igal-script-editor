export default function setStyle(conifg) {
    setFontSize(conifg.fontSize.value)
    setFontFamily(conifg.fontFamily.value)
}

function setFontSize(fontSize) {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
}

function setFontFamily(fontFamily) {
    document.documentElement.style.setProperty('--font-family', fontFamily)
}
