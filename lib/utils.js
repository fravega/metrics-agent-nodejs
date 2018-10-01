const path = require('path')
const fs = require('fs')

function findPackageJson(startDir) {
    let dir = path.resolve(startDir || process.cwd())

    do {
        const pkgFile = path.join(dir, "package.json")

        if (!fs.existsSync(pkgFile) || !fs.statSync(pkgFile).isFile()) {
            dir = path.join(dir, "..")
            continue;
        }
        return require(pkgFile)
    } while (dir !== path.resolve(dir, ".."))
    return {}
}

module.exports = {
    findPackageJson
}