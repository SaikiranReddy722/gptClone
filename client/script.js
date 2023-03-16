import bot from "E:/Web_Proj/gptClone/client/assets/bot.svg";
import user from "E:/Web_Proj/gptClone/client/assets/user.svg";

const form = document.querySelector('form');
const chatcontainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
    element.textContent = '';

    loadInterval = setInterval(() =>{
        element.textContent+='.';

        if(element.textContent=='....'){
            element.textContent='';
        }
    },300)
}

function typeText(element,text){
    let index = 0;

    let interval = setInterval(() => {
        if(index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        }else{
            clearInterval(interval);
        }
    },20)
}
// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element


function generateUniqueId(){
    const timestamp = Date.now();
    const randomnumber = Math.random();
    const hexadecimalString = randomnumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe (isAi , value, uniqueId) {
    return (
        `
            <div class="wrapper ${isAi && 'ai'}>
                <div class="chat">
                    <div class="profile">
                        <img
                        src="${isAi ? bot : user}"
                        alt="${isAi ? 'bot' : 'user'}"    
                        />    
                    </div>
                    <div class="message" id=${uniqueId}>${value}</div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    //user's chat Stripe
    chatcontainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    //bot's chat sTripe

    const uniqueId = generateUniqueId();

    chatcontainer.innerHTML += chatStripe(true, ' ',uniqueId);

    //to keep scrolling down 
    chatcontainer.scrollTop = chatcontainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);


    //fetch data from server -> bot's response

    const response = await fetch('http://localhost:5000', {
        method:'POST',
        headers: {
            'Content-Tpye' : 'application/json',
        },
        body: JSON.stringify({
            prompt : data.get('prompt')
        })
    })


    clearInterval(loadInterval);
    messageDiv.innerHTML = ' ';

    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

        typeText(messageDiv,parsedData);
    }else{
        const err = await response.json();

        messageDiv.innerHTML = "Something went wrong";

        alert(err);
    }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup' , (e) => {
    if(e.keyCode === 13){
        handleSubmit(e); 
    }
})