const express=require('express')
const cors=require('cors')
const xml2js=require('xml2js')
const http=require('http')

const app=express()
const port=process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const parser = new xml2js.Parser({ attrkey: "ATTR" });

const News=require('./models')

const connectDB=require('./config/db')
connectDB()

app.get('/', (req,res)=>{
    res.send("Hello World")
})

app.get('/xml', (req, res) => {
    http.get('http://rss.cnn.com/rss/edition.rss', (apiRes) => {
      let xmlData = '';
  
      apiRes.on('data', (chunk) => {
        xmlData += chunk;
      });
  
      apiRes.on('end', () => {
        xml2js.parseString(xmlData, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error parsing XML data');
          } else {
            const news = result["rss"]["channel"][0]["item"]
            // res.json(news)
            news.forEach((item) => {
              const title = item["title"][0]
              const myRegex = /\n\s+|\s+\r/g;
              const cleanedTitle = title.replace(myRegex, '').replace(/\r\n/g, '').replace(/\r/g, '');
  
              const link = item["link"][0]
  
              const imageArray = item["media:group"][0]["media:content"]
              const imageUrlArray = []
              imageArray.forEach((images) => {
                const image = images["$"]["url"]
                imageUrlArray.push(image)
              })

              let description = "";
              let pubDate = "";
  
              if ("description" in item) {
                const cleanedDescription = item["description"][0].replace(myRegex, '').replace(/\r\n/g, '').replace(/\r/g, '');
                description += cleanedDescription
              }
              if ("pubDate" in item) {
                pubDate += item["pubDate"][0]
              }
              const obj={
                title: cleanedTitle,
                link: link,
                pubDate: pubDate,
                image: imageUrlArray,
                description: description
              }
              const newsObj=new News({
                title: cleanedTitle,
                link: link,
                pubDate: pubDate,
                image: imageUrlArray,
                description: description
              })
              newsObj.save()
              res.json(obj)
            })
          }
        })
      })
    })
}) 
  
app.post('/getNews',(req,res)=>{
    res.json(News.find())
})  

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`)
})
