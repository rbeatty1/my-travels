const AriaShow = target =>{
    target.classList.add('active')
    target.setAttribute('aria-hidden', false)
}

const AriaHide = target =>{
    target.classList.remove('active')
    target.setAttribute('aria-hidden', true)
}

export {AriaShow, AriaHide}