import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { colors } from '../constants/theme'

const Loader = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
    )
}

export default Loader