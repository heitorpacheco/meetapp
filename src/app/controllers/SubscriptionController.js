import { isBefore } from 'date-fns';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async index(req, res) {
    const subscription = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [User],
    });

    res.json(subscription);
  }

  async store(req, res) {
    const { meetup_id } = req.params;
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(meetup_id);

    if (meetup.user_id === req.userId) {
      res.status(400).json({
        error:
          'Você não pode se cadastrar em um evento que você é o organizador',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'Esse evento já ocorreu' });
    }

    const subscriptionExits = await Subscription.findOne({
      where: {
        user_id,
        meetup_id,
      },
    });

    if (subscriptionExits) {
      return res
        .status(400)
        .json({ error: 'Você já está inscrito no Evento.' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: 'Você não pode se inscrever em dois eventos no mesmo horário',
      });
    }

    const subscription = await Subscription.create({
      user_id,
      meetup_id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
