const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const mongoose = require("mongoose");
const _ = require("lodash");

//const date = require(__dirname + "/date.js");

const app = express();


app.use(bodyParser.urlencoded({extended : true}));

app.use(express.static("public"));

app.set("view engine" , "ejs");


//////////////////DATA BASE CONNECTION//////////////////////////////////////////////////


mongoose.set('strictQuery' , false);
mongoose.connect("mongodb+srv://admin-leo:Zapatero4265@cluster0.ls173t2.mongodb.net/todolistDb" , {useNewUrlParser: true});


		//THE SCHEMA OF OUR INFORMATION//
const itemsSchema = new mongoose.Schema({
	name: String
})
		// CREATION OF OUR COLLECTION/TABLE //
		// ADDING THE SCHEMA TO OUR COLLETION//
const Item = mongoose.model("Item" , itemsSchema);

	// DEFAULT ITEMS TO WORK IN OUR LIST //
const item1 = new Item({
	name: "Welcome to your new list"
});
const item2 = new Item({
	name: 'Hit the + button to add an item'
});

const item3 = new Item({
	name: 'Hit the checkbox to delte an item'
});


const defaultItems = [item1, item2 , item3];


///////////////////////////////////////////////////////////////////////////////






///////////////////////////////////////////////////////////////////////
		// A NEW SCHEMA TO THE DIFFERENTS LISTS OF TO DO //
const listSchema = {
	name: String,
	items: [itemsSchema]
};


		// CREATING THE COLLECTION/TABLE//
		// ADDING THE SCHEMA TO OUR NEW COLLECTION//
const List = mongoose.model("List" , listSchema)
////////////////////////////////////////////////////////////////////







///////////////////////////////////////////////////////////
app.get("/" , function(req,res){

//const day = date.getDate();
	// LOOKING FOR EVERY ITEM IN ITEMCOLLECTION //
	// THE RESULTS ITS GOIND TO BE AN ARRAY //

Item.find({}, function(err,foundItems){
	// WITH THIS I GET SECURE THAT ONLY IF THE ARRAY IS EMPTY//
	// I WILL INSERT THE ITEMS, SO TO DO IT ONLY ONCE//
	if (foundItems.length === 0) {
				Item.insertMany(defaultItems, function(err){
			if (err) {
				console.log(err);
			} else {
				console.log("Successfully Updated");
			}
});

res.redirect("/");

	}else {
		res.render("list",{listTitle: "Today", newListItems: foundItems});
	}


	});
	
});

////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////
// THIS IS THE WAY TO CREATE NEW PAGES DYNAMICALLY //
app.get("/:customListName" , function(req,res){

const customListName = _.capitalize(req.params.customListName);



// HOW TO KNOW IF THE NEWLIST ALREADY EXISTS //
// FIND ONE BRINGS BACK AN OBJET NOT AN ARRAY BE CAREFUL //
List.findOne({name : customListName}, function(err, foundList){
	if(!err){
		if (!foundList) {
			// create a new list //
			const newCustomName = new List({
				name : customListName,
				items: defaultItems
				});

		newCustomName.save()


		// if i do not redirect the listname will not be shown//
		res.redirect("/" + customListName);



		}else {

		res.render("list",{listTitle: foundList.name, newListItems: foundList.items});

		}
	}

});

});
///////////////////////////////////////////////////////////////






/////////////////////////////////////////////////////////////
app.post("/" , function(req,res){

 const itemName = req.body.newItem
 const listName = req.body.list
 

const item = new Item({
	name: itemName
});


// this is the default list//
if (listName === "Today") {
item.save();

res.redirect("/");

} else {
// this is the new list that was created //
List.findOne({name: listName}, function(err, foundList){
	foundList.items.push(item)
	foundList.save();
	res.redirect("/" + listName);
});



}



	
});

///////////////////////////////////////////////////////////







//////////////////////////////////////////////////////////
app.post("/delete", function(req,res){
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Today") {
			Item.findByIdAndRemove(checkedItemId, function(err){
		if (!err) {
			console.log("Successfuly deleted");
			
			 res.redirect("/");
		} else {
		}
	});

}else {
	// here i delete an item but depending on which lists it is added//
	List.findOneAndUpdate({name : listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
		if (!err) {
			console.log("Succesfully deleted")
			res.redirect("/" + listName);
		} 

	});

	


}

	
});

/////////////////////////////////////////////////////////////









///////////////////////////////////////////////////////////
app.get("/about" , function (req,res){
	res.render("about");
})
///////////////////////////////////////////////////////////












app.listen(3000, function(){
	console.log("server is runnig");
})
