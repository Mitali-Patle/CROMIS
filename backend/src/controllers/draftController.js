import DraftProposal from "../models/DraftProposal.js";

/**
 * Create or update a draft proposal
 * Max 5 drafts per user
 */
export const saveDraft = async (req, res) => {
  try {
    const requester = req.user.id;
    const {
      draftId,
      resource,
      date,
      startTime,
      endTime,
      purpose,
      attachments,
    } = req.body;

    // Update existing draft
    if (draftId) {
      const draft = await DraftProposal.findOne({
        _id: draftId,
        requester,
      });

      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }

      draft.resource = resource ?? draft.resource;
      draft.date = date ? new Date(date) : draft.date;
      draft.startTime = startTime ?? draft.startTime;
      draft.endTime = endTime ?? draft.endTime;
      draft.purpose = purpose ?? draft.purpose;
      draft.attachments = attachments ?? draft.attachments;

      await draft.save();
      return res.json(draft);
    }

    // Create new draft (max 5)
    const count = await DraftProposal.countDocuments({ requester });
    if (count >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum 5 drafts allowed per user" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const draft = await DraftProposal.create({
      requester,
      resource: resource || null,
      date: date ? new Date(date) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      purpose: purpose || "",
      attachments: attachments || [],
      expiresAt,
    });

    return res.status(201).json(draft);
  } catch (err) {
    console.error("saveDraft:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all drafts for logged-in user
 */
export const getMyDrafts = async (req, res) => {
  try {
    const drafts = await DraftProposal.find({
      requester: req.user.id,
    }).sort({ updatedAt: -1 });

    return res.json(drafts);
  } catch (err) {
    console.error("getMyDrafts:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete a draft
 */
export const deleteDraft = async (req, res) => {
  try {
    const draft = await DraftProposal.findOneAndDelete({
      _id: req.params.id,
      requester: req.user.id,
    });

    if (!draft) {
      return res.status(404).json({ error: "Draft not found" });
    }

    return res.json({ message: "Draft deleted successfully" });
  } catch (err) {
    console.error("deleteDraft:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
