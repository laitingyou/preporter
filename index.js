#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { spawn, spawnSync } = require('child_process')
const args = process.argv.slice(2)
const file = path.resolve('./reporter.html')
const baseArgs = [
	args[0] || '.',
	'--config',
	path.join(__dirname, 'config.js'),
	'-f',
	'codeframe',
	'--no-color',
	'--ignore-path',
	path.join(__dirname, '.eslintignore'),
	'--ext',
	'.js',
	'--ext',
	'.jsx',
	'--ext',
	'.ts',
	'--ext',
	'.vue',
	// '--resolve-plugins-relative-to',
	// path.join(__dirname),
]
const data = spawnSync(process.platform === "win32"?'eslint.cmd': 'eslint', [...baseArgs], {
    cwd: path.resolve(),
    encoding: 'utf8',
    // stdio: 'inherit'
})
if(data.stderr){
	console.log(data.stderr)
	process.exit(1)
}
function EncodeURIFilter(str) {
	if(str != null && str != "") {
	    str = str.replace(/\<script\>/g, "script");
	    str = str.replace(/\<\/script\>/g, "script");
	    str = str.replace(/'/g, "\\'");
	   }
	  return str;
 }
data.stdout = EncodeURIFilter(data.stdout)
const filterError = function(){
	try{
		return (data.stdout||'').match(/((error\:)[\s\S]*?)(?=(error|warning))/g).filter(text => !/^(errors)/.test(text))
	}catch(e){
		return []
	}
}

const filterWarning = function(){
	try{
		return (data.stdout||'').match(/((warning\:)[\s\S]*?)(?=(error|warning))/g).filter(text => !/^(warnings)/.test(text))
	}catch(e){
		return []
	}
}
// console.log(JSON.stringify(filterError()))
const html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')
const result = html
	.replace(/\$errors\$/, JSON.stringify(filterError()) || [])
	.replace(/\$warning\$/, JSON.stringify(filterWarning()) || [])
	.replace(/\$name\$/, args[1])

fs.writeFile(file, result, { encoding: 'utf8' }, err => {})
