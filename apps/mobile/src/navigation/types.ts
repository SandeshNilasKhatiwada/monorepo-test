import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type AuthStackParamsList = {
    Login: undefined;
    register: undefined;
}

export type AppStackParamsList = {
    Home: undefined
}

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamsList>
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamsList>

