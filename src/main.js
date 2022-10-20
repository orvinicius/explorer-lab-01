import "./css/index.css"
import IMask from "imask"

//Busca os elementos de background da cor do cartão
const ccBgColor01 = document.querySelector(".cc-bg svg > g g:nth-child(1) path")
const ccBgColor02 = document.querySelector(".cc-bg svg > g g:nth-child(2) path")
const ccLogo = document.querySelector(".cc-logo span:nth-child(2) img") //puxa a propriedade da imagem do logo

//função para mudança de cor de acordo com a bandeira do cartão
function setCardType(type) {
  const colors = {
    //objeto com as cores de acordo com o tipo de bandeira
    visa: ["#436D99", "#2D57F2"],
    mastercard: ["#DF6F29", "#C69347"],
    elo: ["#F8C307", "#0C1C52"],
    default: ["black", "gray"],
  }
  //seta as propriedades CSS  de acordo com a bandeira passada pelo parâmetro "type" da função "setCardType"
  ccBgColor01.setAttribute("fill", colors[type][0])
  ccBgColor02.setAttribute("fill", colors[type][1])
  ccLogo.setAttribute("src", `cc-${type}.svg`)
}
//setCardType("elo")

globalThis.setCardType = setCardType //torna função global para manipulação

//security code
const securityCode = document.querySelector("#security-code")
const securityCodePattern = {
  mask: "0000",
}
const securityCodeMasked = IMask(securityCode, securityCodePattern)

//expiration date
const expirationDate = document.querySelector("#expiration-date")
const expirationDatePattern = {
  mask: "MM{/}YY", //padrão de máscara para aceitar padrão de mes/ano
  blocks: {
    MM: {
      mask: IMask.MaskedRange, //cria um range de numero de 1 a 12
      from: 1,
      to: 12,
    },
    YY: {
      mask: IMask.MaskedRange, //cria um range de numero de datas usando a função 'new Date().getFullYear' (pega o ano atualizado) e mostra os dois ultimos digitos
      from: String(new Date().getFullYear()).slice(2),
      to: String(new Date().getFullYear() + 10).slice(2), //pega o ano atual e soma 10 anos para aceitar os próximos 10 anos
    },
  },
}
const expirationDateMasked = IMask(expirationDate, expirationDatePattern) //pega o id do input e aplica o padrão de regras criado no "expirationDatePattern"

//card number
const cardNumber = document.querySelector("#card-number")
const cardNumberPattern = {
  mask: [
    {
      mask: "0000 0000 0000 0000",
      regex: /^4\d{0,15}/,
      cardtype: "visa",
    },
    {
      mask: "0000 0000 0000 0000",
      regex: /(^5[1-5]\d{0,2}|^22[2-9]\d{0,1}|^2[3-7]\d{0,2})\d{0,12}/,
      cardtype: "mastercard",
    },
    {
      mask: "0000 0000 0000 0000",
      regex:
        /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
      cardtype: "elo",
    },
    {
      mask: "0000 0000 0000 0000",
      cardtype: "default",
    },
  ],
  dispatch: function (appended, dynamicMasked) {
    //recurso do IMask para executar o padrão de regex
    const number = (dynamicMasked.value + appended).replace(/\D/g, "") //pega o valor digitado e substitui qualquer letra por vazio (permite apenas numeros)
    const foundMask = dynamicMasked.compiledMasks.find(function (item) {
      //procura a mascara de acordo com o numero digitado
      return number.match(item.regex) //return o regex do tipo de cartão digitado
    })
    console.log(foundMask)

    return foundMask
  },
}

const cardNumberMasked = IMask(cardNumber, cardNumberPattern) //executa o IMask para o padrão de numero do cartão

const addButton = document.querySelector("#add-card")
addButton.addEventListener("click", () => {
  alert("Cartão adicionado!")
  window.location.reload(true)
})

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault()
})

const cardHolder = document.querySelector("#card-holder")
cardHolder.addEventListener("input", () => {
  // verifica quando é digitado algo no input
  const ccHolder = document.querySelector(".cc-holder .value")

  ccHolder.innerText =
    cardHolder.value.length === 0 ? "FULANO DA SILVA" : cardHolder.value //pega o valor digitado e altera o valor escrito no cartão (se nao houver valor retorna "FULANO DA SILVA")
})

securityCodeMasked.on("accept", () => {
  // se a mascara criada for aceita executa a função "updateSecurityCode"
  updateSecurityCode(securityCodeMasked.value)
})

function updateSecurityCode(code) {
  //pega o valor digitado e altera o valor  escrito no CVC
  const ccSecurity = document.querySelector(".cc-security .value")
  ccSecurity.innerText = code.length === 0 ? "123" : code
}

//atualiza o numero do cartão visualmente caso a mascara seja aceita
cardNumberMasked.on("accept", () => {
  const cardType = cardNumberMasked.masked.currentMask.cardtype //Acessa o tipo do cartão no objeto da mascara criada
  setCardType(cardType)
  UpdateCardNumber(cardNumberMasked.value)
})

function UpdateCardNumber(number) {
  //pega o valor digitado e altera o valor  escrito no numero do cartão visualmente
  const ccNumber = document.querySelector(".cc-number")
  ccNumber.innerText = number.length === 0 ? "1234 5678 9012 3456" : number
}

expirationDateMasked.on("accept", () => {
  updateExpirationDate(expirationDateMasked.value)
})

function updateExpirationDate(date) {
  const ccExpiration = document.querySelector(".cc-extra .value")
  ccExpiration.innerText = date.length === 0 ? "02/32" : date
}
