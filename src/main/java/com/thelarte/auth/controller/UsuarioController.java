package com.thelarte.auth.controller;

import com.thelarte.auth.dto.UserEditDTO;
import com.thelarte.auth.dto.UserResponseDTO;
import com.thelarte.auth.entity.User;
import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UserService userService;

    public UsuarioController(UserService userService) {
        this.userService = userService;
    }

    // Listar usuarios
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> listarUsuarios() {
        List<UserResponseDTO> result = userService.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Obtener usuario por username
    @GetMapping("/{username}")
    public ResponseEntity<UserResponseDTO> getUsuario(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toDto(userOpt.get()));
    }

    // Editar usuario
    @PutMapping("/{username}")
    public ResponseEntity<UserResponseDTO> editarUsuario(
            @PathVariable String username, @RequestBody UserEditDTO editDto) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        // Cambiar username si es diferente y disponible
        if (editDto.getUsername() != null && !editDto.getUsername().equals(user.getUsername())) {
            if (userService.existsByUsername(editDto.getUsername())) {
                return ResponseEntity.badRequest().build(); // username ya en uso
            }
            user.setUsername(editDto.getUsername());
        }

        if (editDto.getPassword() != null && !editDto.getPassword().isEmpty()) {
            user.setPassword(userService.encodePassword(editDto.getPassword()));
        }
        if (editDto.getRoles() != null && !editDto.getRoles().isEmpty()) {
            List<UserRole> roles = editDto.getRoles().stream()
                    .map(UserRole::valueOf)
                    .collect(Collectors.toList());
            user.setRoles(roles);
        }
        if (editDto.getActive() != null) {
            user.setActive(editDto.getActive());
        }
        userService.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    // Eliminar usuario
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        userService.deleteByUsername(username);
        return ResponseEntity.noContent().build();
    }

    // Mapper
    private UserResponseDTO toDto(User user) {
        List<String> roles = user.getRoles() != null
                ? user.getRoles().stream().map(Enum::name).collect(Collectors.toList())
                : List.of();
        return new UserResponseDTO(user.getId(), user.getUsername(), roles, user.isActive());
    }
}