document.addEventListener('submit', async function (event) {
    let form = event.target;

    if (!form.hasAttribute('data-enhanced')) {
      return;
    }

    event.preventDefault();
    form.classList.add('loading');

    let formData = new FormData(form);
    formData.append('enhanced', 1);

    if (event.submitter) {
      formData.append(event.submitter.name, event.submitter.value);
    }

    const response = await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams(formData)
    })

    const responseText = await response.text();
    const parser = new DOMParser();
    const responseDOM = parser.parseFromString(responseText, 'text/html');

    const newState = responseDOM.querySelector('[data-enhanced="' + form.getAttribute('data-enhanced') + '"]');
    form.outerHTML = newState.outerHTML;

    const newForm = document.querySelector('[data-enhanced="' + form.getAttribute('data-enhanced') + '"]');
    newForm.classList.add('animation-success');
  })