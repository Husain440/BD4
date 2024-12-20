const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const {open} = require('sqlite')

const app = express();
const port = 3010;
app.use(cors())
app.use(express.json())

let db;

(async()=>{
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
})();


async function fetchAllRestaurants(){
  const query = "select * from restaurants";
  const response = await db.all(query,[]);
  return {restaurants : response}
}
app.get("/restaurants", async(req,res)=>{
  try{
    const result = await fetchAllRestaurants();

    if(result.restaurants.length === 0){
      return res.status(404).json({message: "No restaurants found"})
    }
   return res.status(200).json(result)
  }catch(error){
    return res.status(500).json({error: error.message})
  }
})


async function fetchRestaurantById(id){
    const query = "select * from restaurants where id = ?";
    const response = await db.all(query, [id]);
    return {restaurant : response}
}
app.get("/restaurants/details", async(req, res)=>{
  const id = parseInt(req.query.id);
  try{
    const result = await fetchRestaurantById(id);

    if(result.restaurant.length === 0){
      return res.status(404).json({message: "No restaurant found by id"});
    }

    res.status(200).json(result)

  }catch(error){
    return res.status(500).json({error: error.message})
  }
})

async function fetchRestaurantByCuisine(cuisine){
  const query =  "select * from restaurants where cuisine = ?";
  const response = await db.all(query, [cuisine])
  return {restaurants : response}
}
app.get("/restaurants/cuisine", async(req,res)=>{
   const cuisine = req.query.cuisine;
   try {
      const result = await fetchRestaurantByCuisine(cuisine);
      if(result.restaurants.length === 0){
        return res.status(404).json({message: "No restaurants found for " + cuisine})
      }
      res.status(200).json(result)
   } catch (error) {
    return res.status(500).json({error: error.message})
   }
})


async function restaurantsByFilter(isVeg, hasOutdoorSeating, isLuxury){
   const query = "select * from restaurants where isVeg = ? AND hasOutdoorSeating = ? AND isLuxury = ?";
   const response = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
   return {restaurants: response}
}
app.get("/restaurants/filter", async(req,res)=>{
     const isVeg = req.query.isVeg === "true";
     const hasOutdoorSeating = req.query.hasOutdoorSeating === "true";
     const isLuxury = req.query.isLuxury === "true";
     console.log(isLuxury)
     try{
        const result = await restaurantsByFilter(isVeg, hasOutdoorSeating, isLuxury);
        console.log(result)
        if(result.restaurants.length === 0){
         return res.status(404).json({message: "No restaurants found"})
        }
       return res.status(200).json(result)
     }catch(error){
       return res.status(500).json({error: error.message})
     }
})

async function sortByRatingRestaurats(){
   const query = "select * from restaurants order by rating desc";
   const response = await db.all(query, []);
   return {restaurants : response}
}
app.get("/restaurants/sort-by-rating", async(req,res)=>{
   try {
      const results = await sortByRatingRestaurats();
      if(results.restaurants.length === 0){
        return res.status(404).json({message:"No restaurants found"})
      }
      return res.status(200).json(results)
   } catch (error) {
      return res.status(500).json({error: error.message})
   }
})

async function fetchAllDishes(){
  const query = "select * from dishes";
  const response = await db.all(query, []);
  return {dishes: response}
}

app.get("/dishes", async(req,res)=>{
  try {
    const results = await fetchAllDishes();
  } catch (error) {
    return res.status(500).json({error: error.message})
  }
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
