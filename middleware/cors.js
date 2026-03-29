import cors from "cors"

export const corsConfig = cors({
  origin:  "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE" , "PATCH"],

})

export default corsConfig
