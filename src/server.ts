import express from 'express'
const app = express()
import {Pool} from "pg"
const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})