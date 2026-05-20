import dotenv from 'dotenv'
import { cwd } from 'node:process'
import path from "path"
dotenv.config({
    path: path.join(cwd(), '.env')
})

export const config = {
    PORT: process.env.PORT as string,
    CONNECTION_STRING: process.env.CONNECTION_STRING as string
}