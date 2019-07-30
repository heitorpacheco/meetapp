import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    // const meetups = await Meetup.findAll({
    //   where: { user_id: req.userId },
    // });

    // const getMeetups = meetups.map(meet => {
    //   const { id, title, description, location, date } = meet;

    //   return {
    //     id,
    //     title,
    //     description,
    //     location,
    //     date,
    //     availableUpdate: isAfter(date, new Date()),
    //   };
    // });

    // return res.json(getMeetups);

    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date, file_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Datas anteriores não são permitidas' });
    }

    const user_id = req.userId;

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

  async update(req, res) {
    const { id } = req.params;
    const meetups = await Meetup.findOne({
      where: { id },
    });

    if (!(meetups.user_id === req.userId)) {
      return res
        .status(400)
        .json({ error: 'Você não é organizador desse evento.' });
    }

    if (isBefore(parseISO(meetups.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Você não pode alterar um evento de data passada.' });
    }

    const { title, description, location, date } = await meetups.update(
      req.body
    );

    return res.json({
      title,
      description,
      location,
      date,
    });
  }

  async destroy(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (isBefore(parseISO(meetup.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Você não pode excluir um evento que já ocorreu.' });
    }

    await meetup.destroy();

    return res.json({ Message: 'Registro Removido' });
  }
}

export default new MeetupController();
