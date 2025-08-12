package com.thelarte.auth.controller;

import com.thelarte.auth.dto.UserEditDTO;
import com.thelarte.auth.dto.UserWithEmpleadoDTO;
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

    // Listar usuarios con información del empleado
    @GetMapping
    public ResponseEntity<List<UserWithEmpleadoDTO>> listarUsuarios() {
        List<UserWithEmpleadoDTO> result = userService.findAllWithEmpleados();
        return ResponseEntity.ok(result);
    }

    // Obtener usuario por username con información del empleado
    @GetMapping("/{username}")
    public ResponseEntity<UserWithEmpleadoDTO> getUsuario(@PathVariable String username) {
        return userService.findByUsernameWithEmpleado(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Editar usuario
    @PutMapping("/{username}")
    public ResponseEntity<UserWithEmpleadoDTO> editarUsuario(
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
                .map(user -> userService.findByUsernameWithEmpleado(user.getUsername()).orElse(null))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Eliminar usuario
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable String username) {
        if (userService.findByUsername(username).isPresent()) {
            userService.deleteByUsername(username);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
