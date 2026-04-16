package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Reward;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.RewardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock
    private RewardRepository rewardRepository;

    @Mock
    private FormationRepository formationRepository;

    @InjectMocks
    private RewardService rewardService;

    private Formation mockFormation;

    @BeforeEach
    void setUp() {
        mockFormation = new Formation();
        mockFormation.setId(1L);
        mockFormation.setTitle("Formation IT");
    }

    // ✅ FIXED GENERIC MOCK (important!)
    private void mockSave() {
        when(rewardRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Should assign EXPERT badge when score >= 90%")
    void shouldAssignExpertBadgeWhen90Percent() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(mockFormation));
        mockSave();

        Reward reward = rewardService.assignReward(1L, 95);

        assertNotNull(reward);
        assertEquals(Reward.Level.EXPERT, reward.getLevel());
        assertEquals(Reward.RewardType.BADGE, reward.getType());
    }

    @Test
    @DisplayName("Should assign ADVANCED badge when score >= 75%")
    void shouldAssignAdvancedBadgeWhen75Percent() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(mockFormation));
        mockSave();

        Reward reward = rewardService.assignReward(1L, 80);

        assertNotNull(reward);
        assertEquals(Reward.Level.ADVANCED, reward.getLevel());
    }

    @Test
    @DisplayName("Should assign INTERMEDIATE level when score >= 60%")
    void shouldAssignIntermediateLevelWhen60Percent() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(mockFormation));
        mockSave();

        Reward reward = rewardService.assignReward(1L, 65);

        assertNotNull(reward);
        assertEquals(Reward.Level.INTERMEDIATE, reward.getLevel());
    }

    @Test
    @DisplayName("Should assign BEGINNER level when score < 60%")
    void shouldAssignBeginnerLevelWhenBelow60Percent() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(mockFormation));
        mockSave();

        Reward reward = rewardService.assignReward(1L, 50);

        assertNotNull(reward);
        assertEquals(Reward.Level.BEGINNER, reward.getLevel());
    }

    @Test
    @DisplayName("Should return all rewards")
    void shouldGetAllRewards() {
        Reward r = new Reward();
        r.setName("Badge Expert");

        when(rewardRepository.findAll()).thenReturn(List.of(r));

        List<Reward> rewards = rewardService.getAll();

        assertNotNull(rewards);
        assertEquals(1, rewards.size());
    }

    @Test
    @DisplayName("Should delete reward when exists")
    void shouldDeleteReward() {
        when(rewardRepository.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> rewardService.delete(1L));
        verify(rewardRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw when deleting non-existing reward")
    void shouldThrowWhenDeletingNonExistingReward() {
        when(rewardRepository.existsById(99L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> rewardService.delete(99L));
    }

    @Test
    @DisplayName("Should create reward successfully")
    void shouldCreateReward() {
        Reward reward = new Reward();
        reward.setFormation(mockFormation);

        when(formationRepository.findById(1L)).thenReturn(Optional.of(mockFormation));
        mockSave();

        Reward result = rewardService.create(reward);

        assertNotNull(result);
        assertEquals(mockFormation, result.getFormation());
    }

    @Test
    @DisplayName("Should throw when creating reward without formation")
    void shouldThrowWhenCreatingWithoutFormation() {
        Reward reward = new Reward();

        assertThrows(RuntimeException.class, () -> rewardService.create(reward));
    }
}