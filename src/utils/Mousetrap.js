import Mousetrap from 'mousetrap'

//覆盖停止回调
Mousetrap.prototype.stopCallback = function(e, element, combo) {
    return false
}

export default Mousetrap
