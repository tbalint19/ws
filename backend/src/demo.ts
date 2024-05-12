import fs from 'fs'
import axios from 'axios'

const file = fs.readFileSync("/Users/balinttoth/Desktop/daily.png")
const url = "https://newcomm-academy.fra1.digitaloceanspaces.com/webshop/demo/daily.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DO009RWAUVE237MZ28ZG%2F20240509%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20240509T074355Z&X-Amz-Expires=900&X-Amz-Signature=77056e3dec04b24be1a14328ff7ef588b87c5003b8fd445f2fbbaef9cd97ac37&X-Amz-SignedHeaders=host&x-amz-acl=public-read&x-id=PutObject"

axios({
  method: "put",
  url,
  data: file,
  headers: {
      "Content-Type": "application/octet-stream"
  }
}).then((res) => console.log(res.status))
.catch((err) => console.log("err", err))