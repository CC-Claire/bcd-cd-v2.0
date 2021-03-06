const populateDropdownFromArray = (element, optionsArray) => {
  optionsArray.forEach((optionContent, i) => {
    const o = document.createElement('option')
    o.textContent = optionContent
    o.value = optionContent
    element.appendChild(o)
  })
}

export { populateDropdownFromArray }

/**
 * Toggle UI buttons active class
 * Adds radio-button group behaviour
 *
 * @param { String , String [] } activate deactivates [] DOM element reference string
 *
 * @return { null }
 *
 */

const activeBtn = function (activate, deactivates = []) {
  const btnToActivate = document.getElementById(activate)
  if (!btnToActivate.classList.contains('active')) {
    btnToActivate.classList.add('active')
    deactivates.forEach((deactivate) => {
      const btnToDeactivate = document.getElementById(deactivate)
      btnToDeactivate.classList.remove('active')
    })
  }
}

export { activeBtn }

const addSpinner = function (divID, src) {
  if (document.querySelector(`#${divID}`)) {
    const spinner = document.createElement('DIV')
    spinner.className = 'theme__text-chart__spinner'
    spinner.innerHTML = `<p> Contacting ${src} </p> <div class="spinner"><div></div><div></div><div></div></div>`
    document.querySelector(`#${divID}`).appendChild(spinner)
  }
}
export { addSpinner }

const removeSpinner = function (divID) {
  if (document.querySelector(`#${divID} .theme__text-chart__spinner`)) {
    // document.querySelector(`${chartDivIds[0]} .theme__text-chart__spinner`).style.display = 'none'
    document.querySelector(`#${divID} .theme__text-chart__spinner`).remove()
  }
}
export { removeSpinner }

const addErrorMessageButton = function (divID, e) {
  if (document.querySelector(`#${divID}`)) {
    const errMsg = document.createElement('DIV')
    errMsg.className = 'theme__text-chart__error'
    errMsg.innerHTML = `<p> ${e} </p>`
    const errBtn = document.createElement('BUTTON')
    errBtn.className = 'theme-btn retry-btn'
    errBtn.innerHTML = 'Try again'
    errBtn.setAttribute('id', `${divID}-retry-btn`)
    errMsg.appendChild(errBtn)
    document.querySelector(`#${divID}`).appendChild(errMsg)
    return errBtn.getAttribute('id')
  }
}
export { addErrorMessageButton }

const removeErrorMessageButton = function (divID) {
  if (document.querySelector(`#${divID} .theme__text-chart__error`)) {
    document.querySelector(`#${divID} .theme__text-chart__error`).remove()
  }
}
export { removeErrorMessageButton }
