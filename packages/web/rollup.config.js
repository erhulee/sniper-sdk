import typescript from "rollup-plugin-typescript2"
import babel from "rollup-plugin-babel"
import alias from "@rollup/plugin-alias"
import nodeResolve from "rollup-plugin-node-resolve"
import path from "path"
import { fileURLToPath } from 'url'

const __filenameNew = fileURLToPath(import.meta.url)
const __dirnameNew = path.dirname(__filenameNew)
export default {
        input: 'index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'es'
            }
        ],
        plugins: [
            alias({
                resolve: ['.tsx', '.ts'],
                entries: [
                    { find: "web",   replacement:  path.resolve(__dirnameNew, "./")},
                ]
            }),
            nodeResolve({
                browser: true
            }),
            typescript({
                tsconfig: "tsconfig.json"
            }),
            babel({
                exclude: "node_modules/**"
            }),
            // terser()
        ]
    }