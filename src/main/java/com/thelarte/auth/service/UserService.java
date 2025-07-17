package com.thelarte.auth.service;

import com.thelarte.auth.entity.User;
import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.repository.UserRepository;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.EmpleadoRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, EmpleadoRepository empleadoRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.empleadoRepository = empleadoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));
    }

    public User createUser(String username, String password) {
        return createUser(username, password, Collections.singletonList(UserRole.VENDEDOR), null);
    }

    public User createUser(String username, String password, List<UserRole> roles) {
        return createUser(username, password, roles, null);
    }

    public User createUser(String username, String password, List<UserRole> roles, String empleadoCedula) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("El nombre de usuario ya está registrado");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRoles(roles);
        newUser.setActive(true);

        // Relación con empleado si existe la cédula
        if (empleadoCedula != null) {
            Optional<Empleado> empleadoOpt = empleadoRepository.findById(empleadoCedula);
            empleadoOpt.ifPresent(newUser::setEmpleado);
        }

        return userRepository.save(newUser);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        userOpt.ifPresent(userRepository::delete);
    }
}
