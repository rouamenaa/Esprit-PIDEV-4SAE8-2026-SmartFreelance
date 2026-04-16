package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Reward;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.RewardRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RewardService {

    private final RewardRepository repo;
    private final FormationRepository formationRepo;

    public RewardService(RewardRepository repo, FormationRepository formationRepo) {
        this.repo = repo;
        this.formationRepo = formationRepo;
    }

    public List<Reward> getAll() {
        return repo.findAll();
    }

    public List<Reward> getByFormation(Long formationId) {
        return repo.findByFormationId(formationId);
    }

    public Reward getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reward not found with id: " + id));
    }

    public Reward create(Reward r) {
        if (r.getFormation() == null || r.getFormation().getId() == null) {
            throw new RuntimeException("Formation is required for a reward");
        }
        Formation formation = formationRepo.findById(r.getFormation().getId())
                .orElseThrow(() -> new RuntimeException("Formation not found with id: " + r.getFormation().getId()));
        r.setFormation(formation);
        return repo.save(r);
    }

    // ✅ Attribution automatique badge + niveau selon score
    public Reward assignReward(Long formationId, int percentage) {
        Formation formation = formationRepo.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with id: " + formationId));

        Reward reward = new Reward();
        reward.setFormation(formation);
        reward.setMinScoreRequired(percentage);

        if (percentage >= 90) {
            reward.setLevel(Reward.Level.EXPERT);
            reward.setName("Badge Expert 🏆");
            reward.setType(Reward.RewardType.BADGE);
            reward.setIconUrl("/icons/expert.png");
        } else if (percentage >= 75) {
            reward.setLevel(Reward.Level.ADVANCED);
            reward.setName("Badge Avancé 🥇");
            reward.setType(Reward.RewardType.BADGE);
            reward.setIconUrl("/icons/advanced.png");
        } else if (percentage >= 60) {
            reward.setLevel(Reward.Level.INTERMEDIATE);
            reward.setName("Badge Intermédiaire 🥈");
            reward.setType(Reward.RewardType.LEVEL);
            reward.setIconUrl("/icons/intermediate.png");
        } else {
            reward.setLevel(Reward.Level.BEGINNER);
            reward.setName("Badge Débutant 🥉");
            reward.setType(Reward.RewardType.LEVEL);
            reward.setIconUrl("/icons/beginner.png");
        }

        return repo.save(reward);
    }

    public Reward update(Long id, Reward r) {
        Reward existing = getById(id);
        existing.setName(r.getName());
        existing.setType(r.getType());
        existing.setLevel(r.getLevel());
        existing.setIconUrl(r.getIconUrl());
        existing.setMinScoreRequired(r.getMinScoreRequired());

        if (r.getFormation() != null && r.getFormation().getId() != null) {
            Formation formation = formationRepo.findById(r.getFormation().getId())
                    .orElseThrow(() -> new RuntimeException("Formation not found with id: " + r.getFormation().getId()));
            existing.setFormation(formation);
        }

        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Reward not found with id: " + id);
        }
        repo.deleteById(id);
    }
}