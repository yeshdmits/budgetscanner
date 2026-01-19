import { Request, Response } from 'express';
import { Settings } from '../models/Settings';

export async function getSettings(_req: Request, res: Response) {
  try {
    let settings = await Settings.findOne({ key: 'default' });

    if (!settings) {
      settings = await Settings.create({ key: 'default', userFullName: '' });
    }

    res.json({
      success: true,
      data: {
        userFullName: settings.userFullName
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { userFullName } = req.body;

    if (typeof userFullName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userFullName must be a string'
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'default' },
      { userFullName: userFullName.trim() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        userFullName: settings.userFullName
      },
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
}
