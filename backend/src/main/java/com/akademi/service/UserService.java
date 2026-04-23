package com.akademi.service;

import com.akademi.dto.response.UserSummaryDto;
import com.akademi.enums.Role;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.User;
import com.akademi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .roles(user.getRole().name())
                .disabled(!user.isActive()) // ← added
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserSummaryDto changeRole(Long id, Role newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return toDto(userRepository.save(user));
    }

    public UserSummaryDto setActive(Long id, boolean active) {
        User user = getUserById(id);
        user.setActive(active);
        return toDto(userRepository.save(user));
    }

    private UserSummaryDto toDto(User u) {
        return new UserSummaryDto(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole(),
                u.isActive(),
                u.getProfilePicture(),
                u.getCreatedAt(),
                u.getPhone(),
                u.getAddress(),
                u.getPersonalEmail(),
                u.getSpecialization()
        );
    }
}