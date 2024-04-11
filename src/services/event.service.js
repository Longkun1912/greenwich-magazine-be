const Event = require("../models/event");
const Contribution = require("../models/contribution");

const eventService = {
  async createEvent(eventForm) {
    try {
      const event = new Event({
        name: eventForm.name,
        description: eventForm.description,
        firstDeadLineDate: eventForm.firstDeadLineDate,
      });
      const createdEvent = await event.save();
      return createdEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async getAllEvents() {
    try {
      return await Event.find();
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  async updateEvent(id, eventDetails) {
    try {
      const event = await Event.findById(id);
      if (!event) {
        throw new Error("Event not found");
      }

      if (eventDetails.name) {
        event.name = eventDetails.name;
      }
      if (eventDetails.description) {
        event.description = eventDetails.description;
      }
      if (eventDetails.firstDeadLineDate) {
        event.firstDeadLineDate = eventDetails.firstDeadLineDate;
        event.finalDeadLineDate = new Date(event.firstDeadLineDate);
        event.finalDeadLineDate.setDate(event.finalDeadLineDate.getDate() + 14);
      }

      const updatedEvent = await event.save();
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async deleteEvent(id) {
    try {
       
        const eventToDelete = await Event.findById(id);
        if (!eventToDelete) {
            throw new Error("Event not found");
        }
        if (eventToDelete.name === "Default Event") {
            throw new Error("Cannot delete Default Event");
        }
        const contributions = await Contribution.find({ event: id });

        const defaultEvent = await Event.findOne({ name: "Default Event" });
        if (!defaultEvent) {
            throw new Error("Default Event not found");
        }
        const defaultEventId = defaultEvent._id;
        for (const contribution of contributions) {
            contribution.event = defaultEventId;
            await contribution.save();
        }

        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            throw new Error("Event not found");
        }
        
        return { message: "Successfully deleted event" };
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
},
  async updateEventForCoordinator(id, eventDetails) {
    try {
      const event = await Event.findById(id);
      if (!event) {
        throw new Error("Event not found");
      }
      if (eventDetails.firstDeadLineDate) {
        event.firstDeadLineDate = eventDetails.firstDeadLineDate;
        event.finalDeadLineDate = new Date(event.firstDeadLineDate);
        event.finalDeadLineDate.setDate(event.finalDeadLineDate.getDate() + 14);
      }
      const updatedEvent = await event.save();
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },
};

module.exports = eventService;
