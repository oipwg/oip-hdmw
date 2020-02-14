const unicodeString = '¼ Test ½ Unicode 😊 ¾ Ψ'

console.log('Original String: ' + unicodeString)

const stringBufferDefault = Buffer.from(unicodeString)
const stringBufferUtf8 = Buffer.from(unicodeString, 'utf8')
const stringBufferAscii = Buffer.from(unicodeString, 'ascii')
const stringBufferUtf16le = Buffer.from(unicodeString, 'utf16le')

const defaultHexString = stringBufferDefault.toString('hex')
const utf8HexString = stringBufferUtf8.toString('hex')
const asciiHexString = stringBufferAscii.toString('hex')
const utf16leHexString = stringBufferUtf16le.toString('hex')

console.log('Default hex', defaultHexString)
console.log('utf8 hex', utf8HexString)
console.log('ascii hex', asciiHexString)
console.log('utf16le hex', utf16leHexString)

const circleDefaultString = Buffer.from(defaultHexString, 'hex').toString()
const circleUtf8String = Buffer.from(utf8HexString, 'hex').toString('utf8')
const circleAsciiString = Buffer.from(asciiHexString, 'hex').toString('ascii')
const circleUtf16leString = Buffer.from(utf16leHexString, 'hex').toString('utf16le')

console.log('circle Default hex', circleDefaultString)
console.log('circle utf8 hex', circleUtf8String)
console.log('circle ascii hex', circleAsciiString)
console.log('circle utf16le hex', circleUtf16leString)
