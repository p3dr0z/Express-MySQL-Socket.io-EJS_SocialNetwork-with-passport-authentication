const socket = io()
const messageInput = document.getElementById('input-message')
const messageForm = document.getElementById('message-form')
const messageField = document.getElementById("message-reverse-back")
const p = document.getElementById('p-user-profile')

socket.on('chat-message', data => {
    appendMessage(data.message, data.user)
})

messageForm.addEventListener('submit', event => {
    event.preventDefault()
    const message = messageInput.value
    const user = p.innerHTML
    appendMessage(message, user);
    socket.emit('send-chat-message', message, user)
    messageInput.value = "";
})

function appendMessage(message, user) {
    let txt = ""
    txt += `<div class="message-box">`
    txt += `<div class="label-name">${user}</div>`
    txt += `<div id="message-box-child" class="message-box-child">${message}</div>`
    txt += `</div>`

    const messageElement = document.createElement('div')
    messageElement.innerHTML = txt
    messageField.append(messageElement)
}