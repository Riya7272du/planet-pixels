const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/destination", (req, res) => {
  res.render("destination");
});

//SPACEPEDIA

router.get("/search", (req, res) => {
  res.render("search");
});
let query;
router.post("/search", async (req, res) => {
  query = req.body.searchQuery;
  res.redirect("/gallery");
});

router.get("/gallery", async (req, res) => {
  if (query != null) {
    try {
      const apiUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
        query
      )}&media_type=image`;

      const response = await axios.get(apiUrl);

      const imageData = response.data.collection.items;
      res.render("gallery", { imageData });
      query = null;
    } catch (error) {
      console.error("Error fetching ISS images:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.redirect("/search");
  }
});

//ASTROVERSE
router.get("/astroverse", (req, res) => {
  res.render("spacepedia");
});

//ASTRONAUTS
router.get("/astronauts", (req, res) => {
  res.render("astronauts");
});

router.get("/astronauts/inspace", async (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/astronaut/?in_space=true", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("astronauts_in_space", { arr: arr });
    });
});

router.get("/astronauts/previous", (req, res) => {
  axios
    .get(
      "https://ll.thespacedevs.com/2.2.0/astronaut/?date_of_death__lt=2023-11-01",
      {
        responseType: "json",
      }
    )
    .then(function (response) {
      const arr = response.data.results;
      console.log(arr.length);
      res.render("astronauts_previous", { arr: arr });
    });
});

router.get("/astronauts/earth", (req, res) => {
  axios
    .get("https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=false", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;

      res.render("astronauts_on_earth", { array: arr });
    });
});

//EVENTS
router.get("/events", (req, res) => {
  res.render("events");
});

router.get("/events/upcoming", (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/event/upcoming/", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("events_upcoming", { array: arr });
    });
});

router.get("/events/previous", (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/event/previous/", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("events_previous", { array: arr });
    });
});

//ROCKETS
router.get("/rockets", (req, res) => {
  res.render("rockets");
});

router.get("/launches/upcoming", async (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/launch/upcoming/", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("rockets_upcoming", { array: arr });
    });
});

router.get("/launches/previous", async (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/launch/previous/", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("rockets_launched", { arr: arr });
    });
});

//EVENTS AND NEWS

router.get("/news", (req, res) => {
  axios
    .get("https://api.spaceflightnewsapi.net/v4/articles/", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("news", { array: arr });
    });
});

//INTERACTIVES

router.get("/chandrayan", (req, res) => {
  res.render("chandrayan");
});

router.get("/iss", (req, res) => {
  res.render("iss");
});

router.get("/marsrover", (req, res) => {
  res.render("marsrover");
});

router.get("/iss/gallery", async (req, res) => {
  try {
    const apiUrl = `https://images-api.nasa.gov/search?q=iss&media_type=image`;

    const response = await axios.get(apiUrl);
    const imageData = response.data.collection.items;
    res.render("issgallery", { imageData }); // Send the image data as a JSON response
  } catch (error) {
    console.error("Error fetching ISS images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/marsrover/gallery", async (req, res) => {
  try {
    const apiUrl = `https://images-api.nasa.gov/search?q=mars rover&media_type=image`;

    const response = await axios.get(apiUrl);
    const imageData = response.data.collection.items;
    res.render("issgallery", { imageData }); // Send the image data as a JSON response
  } catch (error) {
    console.error("Error fetching ISS images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chandrayan/gallery", (req, res) => {
  res.render("chandrayangallery");
});

module.exports = router;
