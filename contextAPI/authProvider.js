import React, {useEffect, useState} from "react";
import { AuthContext } from "./authContext";

export default function AuthProvider({children}){


    return (
        <AuthContext>
            {children}
        </AuthContext>
    )
}