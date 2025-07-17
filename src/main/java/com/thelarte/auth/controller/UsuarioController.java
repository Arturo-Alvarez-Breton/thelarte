package com.thelarte.auth.controller;

import com.thelarte.auth.dto.UserEditDTO;
import com.thelarte.auth.dto.UserResponseDTO;
import com.thelarte.auth.entity.User;
import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
                .toList();
        return ResponseEntity.ok(result);
    }

    // Obtener usuario por username
    @GetMapping("/{username}")
    public ResponseEntity<UserResponseDTO> getUsuario(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(user -> ResponseEntity.ok(toDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Editar usuario
    @PutMapping("/{username}")
    public ResponseEntity<UserResponseDTO> editarUsuario(
            @PathVariable String username,
            @RequestBody UserEditDTO editDto) {

        Optional<User> updated = userService.updateUser(
                username,
                editDto.getUsername(),
                editDto.getPassword(),
                editDto.getRoles() != null
                    ? editDto.getRoles().stream().map(UserRole::valueOf).toList()
                    : null,
                editDto.getActive()
        );

        return updated
                .map(user -> ResponseEntity.ok(toDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Eliminar usuario
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(u -> {
                    userService.deleteByUsername(username);
                    return ResponseEntity.<Void>noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Mapper
    private UserResponseDTO toDto(User user) {
        List<String> roles = user.getRoles() != null
                ? user.getRoles().stream().map(Enum::name).toList()
                : List.of();
        return new UserResponseDTO(user.getId(), user.getUsername(), roles, user.isActive());
    }
}
