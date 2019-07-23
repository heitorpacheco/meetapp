import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const { title, description, location, date, user_id, file_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Datas anteriores não são permitidas' });
    }

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
