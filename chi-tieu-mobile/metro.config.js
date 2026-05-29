const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// expo-quick-actions chỉ export qua "exports" field, cần bật để Metro resolve
config.resolver.unstable_enablePackageExports = true

module.exports = config
