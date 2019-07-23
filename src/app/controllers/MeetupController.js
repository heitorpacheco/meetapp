import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const { title, description, location, date, user_id, file_id } = req.body;

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id,
      file_id,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
