var unicode_string = '¼ Test ½ Unicode 😊 ¾ Ψ'

console.log('Original String: ' + unicode_string)

var string_buffer_default = Buffer.from(unicode_string)
var string_buffer_utf8 = Buffer.from(unicode_string, 'utf8')
var string_buffer_ascii = Buffer.from(unicode_string, 'ascii')
var string_buffer_utf16le = Buffer.from(unicode_string, 'utf16le')

var default_hex_string = string_buffer_default.toString('hex')
var utf8_hex_string = string_buffer_utf8.toString('hex')
var ascii_hex_string = string_buffer_ascii.toString('hex')
var utf16le_hex_string = string_buffer_utf16le.toString('hex')

console.log('Default hex', default_hex_string)
console.log('utf8 hex', utf8_hex_string)
console.log('ascii hex', ascii_hex_string)
console.log('utf16le hex', utf16le_hex_string)

var circle_default_string = Buffer.from(default_hex_string, 'hex').toString()
var circle_utf8_string = Buffer.from(utf8_hex_string, 'hex').toString('utf8')
var circle_ascii_string = Buffer.from(ascii_hex_string, 'hex').toString('ascii')
var circle_utf16le_string = Buffer.from(utf16le_hex_string, 'hex').toString('utf16le')

console.log('circle Default hex', circle_default_string)
console.log('circle utf8 hex', circle_utf8_string)
console.log('circle ascii hex', circle_ascii_string)
console.log('circle utf16le hex', circle_utf16le_string)
