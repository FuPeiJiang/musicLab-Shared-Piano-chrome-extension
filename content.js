// ^q to remove last key
// ^+q to reset all keys
// ^+f to print your keys
// ^+f will also copy your keys to clipboard
console.log("musicLab Shared-Piano EXTENSION ok")
savedArr = []
currentOctave = 5
function printSavedArr() {
  console.log(savedArr.join('\n'))
}
function occurrences(string, subString) {
  const substrLen = subString.length
  string += ""
  subString += ""
  if (substrLen <= 0) return (string.length + 1)

  var n = 0,
    pos = 0,
    step = substrLen

  while (true) {
    pos = string.indexOf(subString, pos)
    if (pos >= 0) {
      ++n
      pos += step
    } else break
  }
  return n
}
window.addEventListener("keydown", (e) => {
  if (e.key === 'q' && e.ctrlKey === true) {
    const keyStr = savedArr.pop()
    currentOctave += occurrences(keyStr, 'z')
    currentOctave -= occurrences(keyStr, 'x')
  } else if (e.key === 'Q' && e.ctrlKey === true && e.shiftKey === true) {
    savedArr = []
    currentOctave = 5
  } else if (e.key === 'F' && e.ctrlKey === true && e.shiftKey === true) {
    savedString = savedArr.join('\n')
    copyTextToClipboard(savedString)
    console.log(savedString)
  }
})
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea")
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = "0"
  textArea.style.left = "0"
  textArea.style.position = "fixed"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!')
  }, function (err) {
    console.error('Async: Could not copy text: ', err)
  })
}


function noteToKeyboardKey(note) {
  obj = { 0: "a", 1: "w", 2: "s", 3: "e", 4: "d", 5: "f", 6: "t", 7: "g", 8: "y", 9: "h", 10: "u", 11: "j" }

  finalStr = ""
  whichOctave = Math.floor(note / 12)
  toObjRangeNote = note - whichOctave * 12

  octaveVector = whichOctave - currentOctave
  currentOctave += octaveVector

  if (octaveVector < 0) {
    finalStr += "z".repeat(-octaveVector)
  } else if (octaveVector > 0) {
    finalStr += "x".repeat(octaveVector)
  }

  return finalStr + obj[toObjRangeNote]
}

async function main() {
  keyboard = document.getElementsByTagName('piano-keyboard')[0]
  kroot = keyboard.shadowRoot
  arr = kroot.querySelectorAll('piano-keyboard-octave')

  mouseDown = 0
  document.documentElement.addEventListener('mousedown', () => {
    // console.log('mouseDown++')
    mouseDown++
  })
  document.documentElement.addEventListener('mouseup', () => {
    // console.log('mouseDown--')
    mouseDown--
  })

  if (arr.length !== 8) {
    throw "arr.length!==8"
  }
  const firstShadowRoot = arr[0].shadowRoot
  const saveQuerySelector = firstShadowRoot.querySelector.bind(firstShadowRoot)
  await new Promise((resolve) => {
    loopTime = 0
    function inner() {
      setTimeout(() => {
        if (loopTime < 60) {
          const element = saveQuerySelector('piano-keyboard-note[note]')
          console.log(element)
          console.log(element.getAttribute('note'))
          // console.log(element.note)
          element.note!==undefined && resolve()
          loopTime++, inner()
        }
      }, 100)
    }
    inner()
    // 100 * 60
    // 6 seconds
  })

  for (let o = 0; o < 8; o++) {

    notesArr = arr[o].shadowRoot.querySelectorAll('piano-keyboard-note')
    for (let n = 0, len = notesArr.length; n < len; n++) {
      kbNote = notesArr[n]
      if (kbNote.note !== 0) {
        kbNote.addEventListener('mouseenter', (note => {
          return () => {
            if (mouseDown) {
              keyToPress = noteToKeyboardKey(note)
              savedArr.push(keyToPress)
            }
          }
        })(kbNote.note)
        ) //addEventListener()

        kbNote.addEventListener('mousedown', (note => {
          return () => {
            keyToPress = noteToKeyboardKey(note)
            savedArr.push(keyToPress)
          }
        })(kbNote.note)
        ) //addEventListener()
      }
    }

  }
}

main()

function awaitNote(element) {
  return new Promise((resolve) => {
    loopTime = 0
    function inner() {
      setTimeout(() => {
        if (loopTime < 60) {
          element.note && resolve()
          loopTime++, inner()
        }
      }, 100)
    }
    inner()
    // 100 * 60
    // 6 seconds
  })

}
