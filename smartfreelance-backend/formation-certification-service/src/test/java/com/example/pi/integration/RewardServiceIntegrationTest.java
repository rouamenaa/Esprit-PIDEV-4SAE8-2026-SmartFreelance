package com.example.pi.integration;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Reward;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.RewardRepository;
import com.example.pi.service.RewardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class RewardServiceIntegrationTest {

    @Autowired
    private RewardService rewardService;

    @MockBean
    private RewardRepository rewardRepository;

    @MockBean
    private FormationRepository formationRepository;

    // ---------------- GET ALL ----------------
    @Test
    void getAll_shouldReturnList() {

        when(rewardRepository.findAll())
                .thenReturn(List.of(new Reward()));

        List<Reward> result = rewardService.getAll();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ---------------- GET BY ID ----------------
    @Test
    void getById_shouldReturnReward() {

        Reward r = new Reward();
        r.setId(1L);

        when(rewardRepository.findById(1L))
                .thenReturn(Optional.of(r));

        Reward result = rewardService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    // ---------------- CREATE ----------------
    @Test
    void create_shouldSaveReward() {

        Formation f = new Formation();
        f.setId(1L);

        Reward r = new Reward();
        r.setName("Reward");
        r.setFormation(f);

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(rewardRepository.save(any(Reward.class)))
                .thenAnswer(i -> i.getArgument(0));

        Reward result = rewardService.create(r);

        assertNotNull(result);
        assertEquals("Reward", result.getName());
    }

    // ---------------- ASSIGN REWARD (EXPERT) ----------------
    @Test
    void assignReward_shouldReturnExpertBadge() {

        Formation f = new Formation();
        f.setId(1L);

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(rewardRepository.save(any(Reward.class)))
                .thenAnswer(i -> i.getArgument(0));

        Reward result = rewardService.assignReward(1L, 95);

        assertEquals(Reward.Level.EXPERT, result.getLevel());
        assertEquals("Badge Expert 🏆", result.getName());
        assertEquals(Reward.RewardType.BADGE, result.getType());
    }

    // ---------------- ASSIGN REWARD (INTERMEDIATE) ----------------
    @Test
    void assignReward_shouldReturnIntermediateBadge() {

        Formation f = new Formation();
        f.setId(1L);

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(rewardRepository.save(any(Reward.class)))
                .thenAnswer(i -> i.getArgument(0));

        Reward result = rewardService.assignReward(1L, 65);

        assertEquals(Reward.Level.INTERMEDIATE, result.getLevel());
        assertEquals("Badge Intermédiaire 🥈", result.getName());
    }

    // ---------------- UPDATE ----------------
    @Test
    void update_shouldModifyReward() {

        Formation f = new Formation();
        f.setId(1L);

        Reward existing = new Reward();
        existing.setId(1L);
        existing.setName("Old");

        Reward update = new Reward();
        update.setName("New");
        update.setType(Reward.RewardType.BADGE);
        update.setLevel(Reward.Level.EXPERT);
        update.setIconUrl("/icon.png");
        update.setMinScoreRequired(90);
        update.setFormation(f);

        when(rewardRepository.findById(1L))
                .thenReturn(Optional.of(existing));

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(rewardRepository.save(any(Reward.class)))
                .thenAnswer(i -> i.getArgument(0));

        Reward result = rewardService.update(1L, update);

        assertEquals("New", result.getName());
        assertEquals(Reward.Level.EXPERT, result.getLevel());
    }

    // ---------------- DELETE ----------------
    @Test
    void delete_shouldCallRepository() {

        when(rewardRepository.existsById(1L)).thenReturn(true);
        doNothing().when(rewardRepository).deleteById(1L);

        rewardService.delete(1L);

        verify(rewardRepository, times(1)).deleteById(1L);
    }

    // ---------------- GET BY FORMATION ----------------
    @Test
    void getByFormation_shouldReturnList() {

        when(rewardRepository.findByFormationId(1L))
                .thenReturn(List.of(new Reward()));

        List<Reward> result = rewardService.getByFormation(1L);

        assertEquals(1, result.size());
    }
}