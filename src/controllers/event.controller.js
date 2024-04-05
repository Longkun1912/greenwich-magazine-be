const eventService = require("../services/event.service");

const eventController = {
  async createEvent(req, res) {
    
    try {
      const eventForm = req.body; // Assumed that event details are sent in the request body
      if (!eventForm.name || !eventForm.description || !eventForm.firstDeadLineDate) {
        return res.status(400).json({ message: "Missing required fields!" });
      }
      const createdEvent = await eventService.createEvent(eventForm);
      res.status(201).json(createdEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllEvents(req, res) {
    try {
      const events = await eventService.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
      const eventDetails = req.body; // Assumed that updated event details are sent in the request body
      const updatedEvent = await eventService.updateEvent(eventId, eventDetails);
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteEvent(req, res) {
    try {
      const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
      const result = await eventService.deleteEvent(eventId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async updateEventForCoordinator(req, res) {
    try {
      const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
      const eventDetails = req.body; // Assumed that updated event details are sent in the request body
      const updatedEvent = await eventService.updateEventForCoordinator(eventId, eventDetails);
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = eventController;
