const WellnessPlan = require('../models/WellnessPlan');
const Pet = require('../models/Pet');

// Default milestones templates
const getTemplate = (species) => {
  const common = [
    { title: 'Initial Health Assessment', description: 'Complete physical exam and health baseline.', category: 'Checkup', targetAgeMonths: 0, icon: 'FaStethoscope' },
    { title: 'Nutrition Setup', description: 'Establishing a balanced diet plan.', category: 'Nutrition', targetAgeMonths: 1, icon: 'FaPaw' },
    { title: 'First Grooming Session', description: 'Introductory grooming to build comfort.', category: 'Grooming', targetAgeMonths: 3, icon: 'FaCut' }
  ];

  const dogSpecific = [
    { title: 'Puppy Vaccination #1', description: 'DHPP, Rabies, and Distemper.', category: 'Vaccination', targetAgeMonths: 2, icon: 'FaSyringe' },
    { title: 'Socialization Phase', description: 'Early interaction with other dogs.', category: 'Training', targetAgeMonths: 4, icon: 'FaDog' },
    { title: 'Basic Obedience', description: 'Learning sit, stay, and come commands.', category: 'Training', targetAgeMonths: 6, icon: 'FaSchool' },
    { title: 'Annual Booster', description: 'Core vaccination renewal.', category: 'Vaccination', targetAgeMonths: 12, icon: 'FaSyringe' }
  ];

  const catSpecific = [
    { title: 'Kitten Vaccination #1', description: 'FVRCP and FeLV.', category: 'Vaccination', targetAgeMonths: 2, icon: 'FaSyringe' },
    { title: 'Scratching Post Training', description: 'Redirecting scratching behavior.', category: 'Training', targetAgeMonths: 4, icon: 'FaCat' },
    { title: 'Indoor Safety Audit', description: 'Ensuring environment is cat-proof.', category: 'Checkup', targetAgeMonths: 5, icon: 'FaHome' },
    { title: 'Feline Wellness Exam', description: 'Comprehensive annual check.', category: 'Checkup', targetAgeMonths: 12, icon: 'FaHeartbeat' }
  ];

  if (species === 'Dog') return [...common, ...dogSpecific].sort((a, b) => a.targetAgeMonths - b.targetAgeMonths);
  if (species === 'Cat') return [...common, ...catSpecific].sort((a, b) => a.targetAgeMonths - b.targetAgeMonths);
  return common;
};

// @desc    Get or Create Wellness Plan for a pet
// @route   GET /api/wellness/:petId
// @access  Private
const getWellnessPlan = async (req, res) => {
  try {
    let plan = await WellnessPlan.findOne({ pet: req.params.petId });

    if (!plan) {
      const pet = await Pet.findById(req.params.petId);
      if (!pet) return res.status(404).json({ message: 'Pet not found' });

      plan = await WellnessPlan.create({
        pet: pet._id,
        user: req.user._id,
        milestones: getTemplate(pet.species)
      });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update milestone status
// @route   PUT /api/wellness/:petId/milestone/:milestoneId
// @access  Private
const updateMilestone = async (req, res) => {
  try {
    const plan = await WellnessPlan.findOne({ pet: req.params.petId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const milestone = plan.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.isCompleted = req.body.isCompleted;
    if (milestone.isCompleted) {
      milestone.completedAt = new Date();
    }

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWellnessPlan,
  updateMilestone
};
