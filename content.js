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


const noteNumberToKey = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"]

function noteToKeyboardKey(note) {

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

  return finalStr + noteNumberToKey[toObjRangeNote]
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

  // if (arr.length !== 8) {
  // throw "arr.length!==8"
  // }
  const firstShadowRoot = arr[0].shadowRoot

  const weakMap_note = new WeakMap()
  let touchOnWhat

  // for (let o = 0; o < 8; o++) {
  for (let o = 0, len = arr.length; o < len; o++) {
    const keysArr = arr[o].shadowRoot.querySelectorAll('piano-keyboard-note')
    for (let n = 0, len = keysArr.length; n < len; n++) {
      const singleKey = keysArr[n]
      const keyNote = parseInt(singleKey.getAttribute('note'))

      //those "blank" notes in-between the piano
      if (keyNote !== 0) {
        //mouse down and enter adjacent key,
        weakMap_note.set(singleKey, keyNote)
        function adjacent(event) {
          if (mouseDown) {
            same(event.target)
          }
        }
        singleKey.addEventListener('mouseenter', adjacent)
        singleKey.addEventListener('mousedown', function(event) {
          same(event.target)
        })
        singleKey.addEventListener('touchstart', function (event) {
          touchOnWhat = event.target
          same(event.target)
        })

      }

    }

  }
  function same(target) {
    const note = weakMap_note.get(target)
    keyToPress = noteToKeyboardKey(note)
    savedArr.push(keyToPress)
  }
  kroot.querySelector(".octaves-7").addEventListener('touchmove', function (event) {
    const bruh1 = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY)
    if (bruh1.nodeName === "PIANO-KEYBOARD") {
      const bruh2 = bruh1.shadowRoot.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY)
      if (bruh2.nodeName === "PIANO-KEYBOARD-OCTAVE") {
        const bruh3 = bruh2.shadowRoot.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY)
        if (bruh3.nodeName === "PIANO-KEYBOARD-NOTE") {
          if (bruh3 !== touchOnWhat) {
            if (bruh3.getAttribute('note') !== "0") {
              touchOnWhat = bruh3
              same(bruh3)
            }
          }
        }
      }
    }
  })

}

main()
